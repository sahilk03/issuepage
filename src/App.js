import "./App.css";
import { useEffect, useState } from "react";
import { TextField, Button } from "@material-ui/core";

function App() {
  const [count, setCount] = useState(2);
  const [currentIssue, setCurrentIssue] = useState({});
  const [searchText, setSearch] = useState("");
  const [api, setApi] = useState("https://api.github.com/repos/facebook/react");
  const [issueList, setIssueList] = useState([]);
  const [filteredList, setfilteredList] = useState([]);

  useEffect(() => {
    fetch(api + "/issues?page=1")
      .then((res) => {
        if (res.status == "200") return res.json();
        else return Promise.reject(res.message);
      })
      .then((data) => {
        if (data) {
          setIssueList((issueList) => [...issueList, ...data]);
        }
      });
    let repo = prompt("Enter owner/repo(Default=facebook/react) :   ");
    if (repo) {
      setApi("https://api.github.com/repos/" + repo);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", (e) => {
      handleScroll(e);
    });
    return () =>
      window.removeEventListener("scroll", (e) => {
        handleScroll(e);
      });
  }, []);

  let openIssueThread = (issueId) => {
    if (issueId) {
      fetch(api + "/issues/" + issueId)
        .then((res) => res.json())
        .then((currentIssue) => {
          setCurrentIssue(currentIssue);
        });
    }
  };

  let handleScroll = (event) => {
    var lastLi = document.querySelector(".container").lastChild;
    if (lastLi) {
      var lastLiOffset = lastLi.offsetTop + lastLi.clientHeight;
      var pageOffset = window.pageYOffset + window.innerHeight;
      if (pageOffset >= lastLiOffset) {
        setCount((count) => {
          fetch(api + "/issues?page=" + count)
            .then((res) => {
              if (res.status == "200") return res.json();
              else return Promise.reject(res.message);
            })
            .then((data) => {
              if (data) {
                setIssueList((issueList) => [...issueList, ...data]);
              }
            });
          return count + 1;
        });
      }
    }
  };

  let onChange = (e) => {
    let text = e.target.value;
    setSearch(text);
    if (text) {
      let arr = issueList.filter((issue) =>
        issue.title.toUpperCase().includes(text.toUpperCase())
      );
      setfilteredList(arr);
    }
  };

  if (currentIssue && Object.entries(currentIssue).length > 0) {
    return (
      <IssueThread
        issue={currentIssue}
        setCurrentIssue={setCurrentIssue}
      ></IssueThread>
    );
  }
  return (
    <div className="App">
      <div className="container">
        <TextField
          id="outlined-search"
          label="Search field"
          type="search"
          variant="outlined"
          className="search"
          placeholder="Search all issues"
          onChange={(e) => onChange(e)}
          value={searchText}
        />

        {issueList &&
          issueList.length > 0 &&
          (searchText
            ? filteredList.length > 0
              ? filteredList
              : [{ title: "No Items found" }]
            : issueList
          ).map((issue) => {
            return (
              <div className="title" key={issue.id}>
                <a
                  className="titlelink"
                  onClick={() => openIssueThread(issue.number)}
                >
                  {issue.title}
                </a>
                {issue.labels &&
                  issue.labels.map((label) => (
                    <span className="labels" key={label.name}>
                      {label.name}
                    </span>
                  ))}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function IssueThread(props) {
  let { issue, setCurrentIssue } = props;
  let [commentList, setCommentList] = useState([issue]);

  useEffect(() => {
    fetch(
      "https://api.github.com/repos/facebook/watchman/issues/" +
        issue.number +
        "/comments"
    )
      .then((res) => {
        if (res.status == "200") return res.json();
        else return Promise.reject(res.message);
      })
      .then((data) => {
        if (data) {
          setCommentList([...commentList, ...data]);
        }
      });
  }, []);

  return (
    <div className="App">
      <div className="container">
        {commentList &&
          commentList.map((comment) => {
            if (comment.body) {
              return (
                <div className="thread_container">
                  <div className="avatar">
                    <img className="avatarimg" src={comment.user.avatar_url} />
                  </div>
                  <div className="thread" key={comment.id}>
                    <div className="commentUser">
                      <h3 className="usrtitle">{comment.user.login}</h3>
                    </div>
                    <div>
                      <p>{`${comment.body}`}</p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        <Button
          className="back"
          variant="contained"
          color="primary"
          onClick={() => setCurrentIssue({})}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

export default App;
