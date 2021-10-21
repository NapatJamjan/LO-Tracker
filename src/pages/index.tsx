import React from 'react';
import { Link } from 'gatsby';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { gql, ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, useMutation } from '@apollo/client';
import xlsx from 'xlsx';

const Home: React.FC = () => {
  return (
    <Layout>
      <Seo title="Home" />
      <h1>Welcome</h1>
      <Link to="/programs" className="underline"><h4> Go to my document </h4></Link>
      <p>A Capstone project about tracking learning outcome of each and all students in your course.</p>
      <Link to="/login" className="line-through"><h4> Login </h4></Link>
      <UploadStudents />
    </Layout>
  );
};

interface StudentExcel {
  id: string;
  email: string;
  name: string;
  surname: string;
}

const UploadStudents: React.FC = () => {
  const [createStudents, {loading: submitting}] = useMutation<{createStudent: {id: string}}, {input: StudentExcel[]}>(gql`
    mutation CreateStudents($input: [CreateStudentInput!]!) {
      createStudents(input: $input) {
        id
      }
    }
  `);
  const uploadToDB = (students: StudentExcel[]) => {
    createStudents({
      variables: {
        input: students
      }
    }).then(() => {
      alert('success');
    }).catch((err) => {
      alert(JSON.stringify(err))
    });
  };
  const excelJSON = (file) => {
    let reader = new FileReader();
    reader.onload = function(e) {
      let data = e.target.result;
      let workbook = xlsx.read(data, {type: 'binary'});
      uploadToDB(xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
    }
    reader.onerror = console.log;
    reader.readAsBinaryString(file);
  };
  return (
    <div>
      <span>upload students: </span>
      <input type="file" onChange={e => excelJSON(e.target.files[0])} className="p-1 mx-2 text-sm"/><br/>
      {submitting && <p>Uploading...</p>}
    </div>
  );
};

const ApolloHome = () => {
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });
  return <ApolloProvider client={client}><Home /></ApolloProvider>
};

export default ApolloHome;
