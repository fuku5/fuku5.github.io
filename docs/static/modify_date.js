
function formatDate(date, sep) {
  const yyyy = date.getFullYear();
  const mm = ('00' + (date.getMonth()+1)).slice(-2);
  const dd = ('00' + date.getDate()).slice(-2);

  return `${yyyy}${sep}${mm}${sep}${dd}`;
}

document.addEventListener("DOMContentLoaded", function() {
  const lastModifiedDate = new Date(document.lastModified);
  document.getElementById("last_modified_date").textContent = formatDate(lastModifiedDate, "/");
});
