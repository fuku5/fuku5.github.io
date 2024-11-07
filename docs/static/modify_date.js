
function formatDate(date, sep) {
  const yyyy = date.getFullYear();
  const mm = ('00' + (date.getMonth()+1)).slice(-2);
  const dd = ('00' + date.getDate()).slice(-2);

  return `${yyyy}${sep}${mm}${sep}${dd}`;
}

function replaceDate() {
  const lastModifiedDate = new Date(document.lastModified);
  $("#last_modified_date").text(
    formatDate(lastModifiedDate, "/")
  );
}

document.addEventListener("DOMContentLoaded", function() {
  replaceDate();
});
