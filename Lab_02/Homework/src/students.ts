export interface Student { id:string; name:string; email:string; className:string; gpa:number }
const names=['Nguyen Van An','Tran Minh Binh','Le Hoang Chi','Pham Ngoc Dung','Hoang Mai Anh','Dang Hoang Long','Vu Thanh Ha','Do Quang Huy','Bui Thu Linh','Ngo Minh Khang'];
export const students:Student[]=Array.from({length:60},(_,i)=>({id:`SV${String(i+1).padStart(3,'0')}`,name:names[i%10]+(i>=10?` ${Math.floor(i/10)+1}`:''),email:`student${i+1}@example.com`,className:`K18-${['A','B','C'][i%3]}`,gpa:Number((2+(i*17%201)/100).toFixed(2))}));
