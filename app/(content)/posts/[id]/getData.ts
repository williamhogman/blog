import { getPostData } from "../../../../lib/posts";

export async function getData(id: string | null | undefined): Promise<
  | {
      notFound: true;
      postData: null;
    }
  | { notFound: false; postData: any }
> {
  if (!id) {
    return { notFound: true, postData: null };
  }
  const postData = await getPostData(id);
  const converedPostData = { ...postData, date: +postData.date };
  return {
    notFound: false,
    postData: converedPostData,
  };
}
