function extract(html)
{   data="";
    flag=0;
    for(var i=0;i<html.length;i++)
    {
       if(html[i]=='{' || html[i]=='[')
       {
           flag=1;
       }
       if(flag==1)
       {
           data+=html[i];
       }

    }

    return data;

}


module.exports=extract;