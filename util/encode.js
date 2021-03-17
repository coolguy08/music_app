function convert(str)
{

r='';
for(var i=0;i<str.length;i++)
{
if(str[i]=='+' || str[i]==' ')
{
r+='%2B';
}
else if(str[i]=='/')
{
r+='%2F';
}
else
{
r+=str[i];
}
}

return r;



}

module.exports=convert;
