/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Layout } from '../../../../components';
import { Meta, GraphContent } from '../../../../components/field';
import { useRouter } from 'next/router';
import { singleFieldSlice, foldersSlice } from '../../../../redux';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import {
  Typography,
  useMediaQuery,
  OutlinedInput,
  InputLabel,
  MenuItem,
  ListItemText,
  Select,
  FormControl
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useWindowSize } from '../../../../hooks';

const gap = 36;

const Wrapper = styled.div({
  width: '100%',
  paddingInline: 32,
  paddingBlock: 32,
  display: 'inline-flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  gap: 40
});

const Header = ({ children }) => {
  return (
    <Typography variant='h5' css={{ margin: 0 }}>
      {children}
    </Typography>
  );
};

function Section({ children, justifyCenter = false, style = {} }) {
  return (
    <div
      css={[
        {
          display: 'flex',
          justifyContent: justifyCenter ? 'center' : 'flex-start',
          gap,
          flexWrap: 'wrap',
          flexShrink: 0,
          position: 'relative'
        },
        style
      ]}
    >
      {children}
    </div>
  );
}

function Filters({
  upTablet,
  field,
  selectedCohort,
  setSelectedCohort,
  selectedInstance,
  setSelectedInstance,
  selectedView,
  setSelectedView,
  views
}) {
  const windowSize = useWindowSize();
  const width = upTablet
    ? Math.floor((windowSize.width - gap * 2 - 72) / 3)
    : '100%';
  return (
    <div
      css={theme => ({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 36,
        [theme.breakpoints.up('tablet')]: {
          flexDirection: 'row'
        }
      })}
    >
      <FormControl css={{ width: '100%' }}>
        <InputLabel id='cohorts'> Select Cohort</InputLabel>
        <Select
          labelId='cohorts'
          value={selectedCohort}
          onChange={e => setSelectedCohort(e.target.value)}
          input={<OutlinedInput label='Select Cohort' />}
        >
          {field.cohorts.map(opt => (
            <MenuItem key={opt} value={opt}>
              <ListItemText primary={opt} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl css={{ width: '100%' }}>
        <InputLabel id='instances'>Select Instance</InputLabel>
        <Select
          labelId='instances'
          value={selectedInstance}
          onChange={e => setSelectedInstance(e.target.value)}
          input={<OutlinedInput label='Select Instances' />}
        >
          {field.instances.map(opt => (
            <MenuItem key={opt} value={opt}>
              <ListItemText primary={opt} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedView ? (
        <FormControl css={{ width: '100%' }}>
          <InputLabel id='graphType'>Select View</InputLabel>
          <Select
            labelId='graphType'
            value={selectedView}
            onChange={e => setSelectedView(e.target.value)}
            input={<OutlinedInput label='Select View' />}
          >
            {views.map(graph => (
              <MenuItem key={graph} value={graph}>
                <ListItemText primary={graph} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
    </div>
  );
}

export default function FieldPage() {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();
  const upTablet = useMediaQuery(theme.breakpoints.up('tablet'));
  const field = useSelector(state => state.singleField.field);
  const folder = useSelector(state =>
    foldersSlice.selectors.folderById(state, router.query.folderID)
  );
  const [selectedCohort, setSelectedCohort] = useState(field?.cohorts[0] || '');

  const views = [];
  if (field?.sampleImage) {
    views.push('Sample Image');
  }
  if (field?.dataDistribution) {
    views.push('Data Distribution');
  }
  if (field?.dataAccumulation) {
    views.push('Data Accumulation');
  }

  const [selectedView, setSelectedView] = useState(views ? views[0] : null);
  const [selectedInstance, setSelectedInstance] = useState(
    field?.instances[0] || ''
  );

  console.log('selectedView: ', selectedView);

  useEffect(() => {
    return () => {
      dispatch(singleFieldSlice.actions.reset());
    };
  }, []);

  useEffect(() => {
    if (field) {
      setSelectedCohort(field.cohorts[0]);
      setSelectedInstance(field.instances[0]);
      if (!selectedView) {
        setSelectedView(views[0]);
      }
    }
  }, [JSON.stringify(field)]);

  function getPaddingTop() {
    switch (true) {
      case upTablet:
        return 122;
      case !upTablet:
        return 222;
    }
  }

  function Description({ text }) {
    return (
      <div
        css={{
          marginTop: -32
        }}
      >
        <Typography>{text}</Typography>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`Pheno Catalog - ${folder?.name} / ${field?.name}`}</title>
      </Head>
      {field ? (
        <Layout page='field' paddingTop={getPaddingTop()}>
          <Wrapper>
            <Header>{field?.name}</Header>
            {field.description && <Description text={field.description} />}
            <Meta />
            {selectedCohort && selectedInstance && selectedView && (
              <Section>
                <Filters
                  upTablet={upTablet}
                  field={field}
                  selectedCohort={selectedCohort}
                  setSelectedCohort={setSelectedCohort}
                  selectedInstance={selectedInstance}
                  setSelectedInstance={setSelectedInstance}
                  selectedView={selectedView}
                  setSelectedView={setSelectedView}
                  views={views}
                />
                <GraphContent
                  upTablet={upTablet}
                  views={views}
                  selectedView={selectedView}
                  selectedCohort={selectedCohort}
                  selectedInstance={selectedInstance}
                />
              </Section>
            )}
          </Wrapper>
        </Layout>
      ) : null}
    </>
  );
}
