import { IPageDocument } from "../Models/Pages";

const FB_URI = process.env.FB_URI as string | "https://graph.facebook.com";

export const refreshPageToken = async (page: IPageDocument, userToken: string) => {
    
    if (page && page?.accessToken.expires*1000 <= Date.now()) {
        const fb_token = await fetch(`${FB_URI}/${page.pageID}?fields=access_token&access_token=${userToken}`)
        const token = await fb_token.json() as {access_token: string};
        
        const fb_response = await fetch(`${FB_URI}/debug_token?input_token=${token.access_token}&access_token=${userToken}`)
        const tokenData = await fb_response.json() as {data: {expires_at: number}};

        page.accessToken = {
            token: token.access_token,
            expires: tokenData.data.expires_at
        }
        console.log(page.accessToken);
        
        try {
            await page.save(); // Save the updated page
        } catch (err) {
            console.error(err);
        }
        
    }
}

export const getUserTokenInfo = async (userToken: string) => {
    const fb_response = await fetch(`${FB_URI}/debug_token?input_token=${userToken}&access_token=${userToken}`)
    const tokenData = await fb_response.json();
    return tokenData.data;
}